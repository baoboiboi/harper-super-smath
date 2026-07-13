import Card from '@/Components/Card';
import InputError from '@/Components/InputError';
import InputLabel from '@/Components/InputLabel';
import Modal from '@/Components/Modal';
import PrimaryButton from '@/Components/PrimaryButton';
import SecondaryButton from '@/Components/SecondaryButton';
import TextInput from '@/Components/TextInput';
import AdminCurriculumLayout from '@/Layouts/AdminCurriculumLayout';
import { Head, Link, router, useForm } from '@inertiajs/react';
import { FormEventHandler, useState } from 'react';

const QUESTION_FORMATS = [
    'multiple_choice',
    'number_input',
    'drag_drop',
    'match_pairs',
    'sort',
    'select_image',
    'fill_blank',
    'visual_counting',
    'timed_challenge',
    'word_problem',
] as const;

type QuestionFormat = (typeof QUESTION_FORMATS)[number];

type QuestionOption = {
    id: number;
    label: string;
    value: string | null;
    is_correct: boolean;
    order: number;
};

type Question = {
    id: number;
    type: QuestionFormat;
    prompt: string;
    correct_answer: { value?: string } | null;
    hint: string | null;
    explanation: string | null;
    points: number;
    order: number;
    options: QuestionOption[];
};

type Activity = {
    id: number;
    type: QuestionFormat;
    title: string;
    instructions: string | null;
    points: number;
    order: number;
    questions: Question[];
};

type Lesson = {
    id: number;
    title: string;
    status: string;
    difficulty: number;
    points_available: number;
    estimated_minutes: number | null;
    unit: { id: number; title: string };
    required_skill: { id: number; name: string } | null;
    activities: Activity[];
};

export default function LessonEditor({
    lesson,
    status,
}: {
    lesson: Lesson;
    status?: string;
}) {
    return (
        <AdminCurriculumLayout header={`Curriculum — ${lesson.title}`}>
            <Head title={`Admin — ${lesson.title}`} />

            {status && (
                <div className="mb-6 rounded-lg bg-green-50 p-4 text-sm font-medium text-green-700 dark:bg-green-900/30 dark:text-green-300">
                    {status}
                </div>
            )}

            <Card className="mb-6">
                <div className="flex items-start justify-between">
                    <div>
                        <p className="text-sm text-gray-500 dark:text-gray-400">{lesson.unit.title}</p>
                        <h3 className="text-lg font-bold text-gray-900 dark:text-white">{lesson.title}</h3>
                        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                            Difficulty {lesson.difficulty}/5 · {lesson.points_available} pts ·{' '}
                            {lesson.estimated_minutes ?? '—'} min
                            {lesson.required_skill && <> · Requires: {lesson.required_skill.name}</>}
                        </p>
                    </div>
                    <Link
                        href={route('admin.curriculum.lessons.index')}
                        className="text-sm text-sky-600 hover:underline"
                    >
                        &larr; All lessons
                    </Link>
                </div>
            </Card>

            <div className="space-y-6">
                {lesson.activities.map((activity) => (
                    <ActivityBlock key={activity.id} lessonId={lesson.id} activity={activity} />
                ))}
            </div>

            <AddActivity lessonId={lesson.id} />
        </AdminCurriculumLayout>
    );
}

function AddActivity({ lessonId }: { lessonId: number }) {
    const [open, setOpen] = useState(false);
    const { data, setData, post, processing, errors, reset } = useForm({
        lesson_id: lessonId,
        type: 'multiple_choice' as QuestionFormat,
        title: '',
        instructions: '',
        points: 10,
    });

    const submit: FormEventHandler = (e) => {
        e.preventDefault();
        post(route('admin.curriculum.activities.store'), {
            onSuccess: () => {
                reset('type', 'title', 'instructions', 'points');
                setOpen(false);
            },
        });
    };

    return (
        <div className="mt-6">
            <PrimaryButton onClick={() => setOpen(true)}>+ Add Activity</PrimaryButton>

            <Modal show={open} onClose={() => setOpen(false)}>
                <form onSubmit={submit} className="p-6">
                    <h2 className="text-lg font-bold text-gray-900 dark:text-white">Add Activity</h2>

                    <div className="mt-4">
                        <InputLabel htmlFor="activity-title" value="Title" />
                        <TextInput
                            id="activity-title"
                            className="mt-1 block w-full"
                            value={data.title}
                            onChange={(e) => setData('title', e.target.value)}
                        />
                        <InputError message={errors.title} className="mt-1" />
                    </div>

                    <div className="mt-4">
                        <InputLabel htmlFor="activity-type" value="Format" />
                        <select
                            id="activity-type"
                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-300"
                            value={data.type}
                            onChange={(e) => setData('type', e.target.value as QuestionFormat)}
                        >
                            {QUESTION_FORMATS.map((format) => (
                                <option key={format} value={format}>
                                    {format.replace('_', ' ')}
                                </option>
                            ))}
                        </select>
                    </div>

                    <div className="mt-4">
                        <InputLabel htmlFor="activity-instructions" value="Instructions" />
                        <textarea
                            id="activity-instructions"
                            rows={2}
                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-300"
                            value={data.instructions}
                            onChange={(e) => setData('instructions', e.target.value)}
                        />
                    </div>

                    <div className="mt-4">
                        <InputLabel htmlFor="activity-points" value="Points" />
                        <TextInput
                            id="activity-points"
                            type="number"
                            min={0}
                            className="mt-1 block w-full"
                            value={data.points}
                            onChange={(e) => setData('points', Number(e.target.value))}
                        />
                    </div>

                    <div className="mt-6 flex justify-end gap-3">
                        <SecondaryButton type="button" onClick={() => setOpen(false)}>
                            Cancel
                        </SecondaryButton>
                        <PrimaryButton disabled={processing}>Save</PrimaryButton>
                    </div>
                </form>
            </Modal>
        </div>
    );
}

function ActivityBlock({ activity }: { lessonId: number; activity: Activity }) {
    const destroy = () => {
        if (confirm(`Delete activity "${activity.title}" and all its questions?`)) {
            router.delete(route('admin.curriculum.activities.destroy', activity.id));
        }
    };

    return (
        <Card>
            <div className="flex items-start justify-between">
                <div>
                    <span className="rounded-full bg-sky-100 px-2 py-1 text-xs font-semibold text-sky-700">
                        {activity.type.replace('_', ' ')}
                    </span>
                    <h4 className="mt-2 font-bold text-gray-900 dark:text-white">{activity.title}</h4>
                    {activity.instructions && (
                        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">{activity.instructions}</p>
                    )}
                </div>
                <button onClick={destroy} className="text-sm font-medium text-red-600 hover:underline">
                    Delete Activity
                </button>
            </div>

            <div className="mt-4 space-y-3 border-t border-gray-100 pt-4 dark:border-gray-700">
                {activity.questions.map((question) => (
                    <QuestionBlock key={question.id} question={question} />
                ))}
            </div>

            <AddQuestion activityId={activity.id} defaultType={activity.type} />
        </Card>
    );
}

function AddQuestion({ activityId, defaultType }: { activityId: number; defaultType: QuestionFormat }) {
    const [open, setOpen] = useState(false);
    const { data, setData, post, processing, errors, reset, transform } = useForm({
        activity_id: activityId,
        type: defaultType,
        prompt: '',
        correct_answer_text: '',
        hint: '',
        explanation: '',
        points: 5,
    });

    transform((formData) => ({
        ...formData,
        correct_answer: formData.correct_answer_text ? { value: formData.correct_answer_text } : null,
    }));

    const submit: FormEventHandler = (e) => {
        e.preventDefault();
        post(route('admin.curriculum.questions.store'), {
            onSuccess: () => {
                reset('prompt', 'correct_answer_text', 'hint', 'explanation');
                setOpen(false);
            },
        });
    };

    return (
        <div className="mt-3">
            <button onClick={() => setOpen(true)} className="text-sm font-medium text-sky-600 hover:underline">
                + Add Question
            </button>

            <Modal show={open} onClose={() => setOpen(false)}>
                <form onSubmit={submit} className="max-h-[80vh] overflow-y-auto p-6">
                    <h2 className="text-lg font-bold text-gray-900 dark:text-white">Add Question</h2>

                    <div className="mt-4">
                        <InputLabel htmlFor="question-prompt" value="Prompt" />
                        <textarea
                            id="question-prompt"
                            rows={2}
                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-300"
                            value={data.prompt}
                            onChange={(e) => setData('prompt', e.target.value)}
                        />
                        <InputError message={errors.prompt} className="mt-1" />
                    </div>

                    <div className="mt-4">
                        <InputLabel htmlFor="question-type" value="Format" />
                        <select
                            id="question-type"
                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-300"
                            value={data.type}
                            onChange={(e) => setData('type', e.target.value as QuestionFormat)}
                        >
                            {QUESTION_FORMATS.map((format) => (
                                <option key={format} value={format}>
                                    {format.replace('_', ' ')}
                                </option>
                            ))}
                        </select>
                    </div>

                    <div className="mt-4">
                        <InputLabel htmlFor="question-correct-answer" value="Correct answer (for non-choice formats)" />
                        <TextInput
                            id="question-correct-answer"
                            className="mt-1 block w-full"
                            value={data.correct_answer_text}
                            onChange={(e) => setData('correct_answer_text', e.target.value)}
                        />
                        <p className="mt-1 text-xs text-gray-400">
                            For multiple choice / match / sort, mark correctness on each answer option instead.
                        </p>
                    </div>

                    <div className="mt-4">
                        <InputLabel htmlFor="question-hint" value="Hint" />
                        <TextInput
                            id="question-hint"
                            className="mt-1 block w-full"
                            value={data.hint}
                            onChange={(e) => setData('hint', e.target.value)}
                        />
                    </div>

                    <div className="mt-4">
                        <InputLabel htmlFor="question-explanation" value="Explanation" />
                        <TextInput
                            id="question-explanation"
                            className="mt-1 block w-full"
                            value={data.explanation}
                            onChange={(e) => setData('explanation', e.target.value)}
                        />
                    </div>

                    <div className="mt-4">
                        <InputLabel htmlFor="question-points" value="Points" />
                        <TextInput
                            id="question-points"
                            type="number"
                            min={0}
                            className="mt-1 block w-full"
                            value={data.points}
                            onChange={(e) => setData('points', Number(e.target.value))}
                        />
                    </div>

                    <div className="mt-6 flex justify-end gap-3">
                        <SecondaryButton type="button" onClick={() => setOpen(false)}>
                            Cancel
                        </SecondaryButton>
                        <PrimaryButton disabled={processing}>Save</PrimaryButton>
                    </div>
                </form>
            </Modal>
        </div>
    );
}

function QuestionBlock({ question }: { question: Question }) {
    const destroy = () => {
        if (confirm('Delete this question and its answer options?')) {
            router.delete(route('admin.curriculum.questions.destroy', question.id));
        }
    };

    return (
        <div className="rounded-xl bg-gray-50 p-4 dark:bg-gray-900">
            <div className="flex items-start justify-between">
                <div>
                    <p className="text-sm font-medium text-gray-900 dark:text-white">{question.prompt}</p>
                    {question.correct_answer?.value && (
                        <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                            Correct answer: {question.correct_answer.value}
                        </p>
                    )}
                </div>
                <button onClick={destroy} className="text-xs font-medium text-red-600 hover:underline">
                    Delete
                </button>
            </div>

            <div className="mt-3 flex flex-wrap gap-2">
                {question.options.map((option) => (
                    <OptionPill key={option.id} option={option} />
                ))}
            </div>

            <AddOption questionId={question.id} />
        </div>
    );
}

function OptionPill({ option }: { option: QuestionOption }) {
    const destroy = () => {
        router.delete(route('admin.curriculum.question-options.destroy', option.id));
    };

    return (
        <span
            className={`inline-flex items-center gap-2 rounded-full px-3 py-1 text-xs font-medium ${
                option.is_correct
                    ? 'bg-green-100 text-green-700'
                    : 'bg-white text-gray-600 ring-1 ring-gray-200 dark:bg-gray-800 dark:text-gray-300'
            }`}
        >
            {option.is_correct && '✓ '}
            {option.label}
            <button onClick={destroy} className="text-gray-400 hover:text-red-600">
                &times;
            </button>
        </span>
    );
}

function AddOption({ questionId }: { questionId: number }) {
    const [open, setOpen] = useState(false);
    const { data, setData, post, processing, errors, reset } = useForm({
        question_id: questionId,
        label: '',
        value: '',
        is_correct: false as boolean,
    });

    const submit: FormEventHandler = (e) => {
        e.preventDefault();
        post(route('admin.curriculum.question-options.store'), {
            onSuccess: () => {
                reset('label', 'value', 'is_correct');
                setOpen(false);
            },
        });
    };

    return (
        <div className="mt-3">
            <button onClick={() => setOpen(true)} className="text-xs font-medium text-sky-600 hover:underline">
                + Add Answer Option
            </button>

            <Modal show={open} onClose={() => setOpen(false)} maxWidth="sm">
                <form onSubmit={submit} className="p-6">
                    <h2 className="text-lg font-bold text-gray-900 dark:text-white">Add Answer Option</h2>

                    <div className="mt-4">
                        <InputLabel htmlFor="option-label" value="Label (shown to the child)" />
                        <TextInput
                            id="option-label"
                            className="mt-1 block w-full"
                            value={data.label}
                            onChange={(e) => setData('label', e.target.value)}
                        />
                        <InputError message={errors.label} className="mt-1" />
                    </div>

                    <label className="mt-4 flex items-center gap-2">
                        <input
                            type="checkbox"
                            checked={data.is_correct}
                            onChange={(e) => setData('is_correct', e.target.checked)}
                        />
                        <span className="text-sm text-gray-700 dark:text-gray-300">This is the correct answer</span>
                    </label>

                    <div className="mt-6 flex justify-end gap-3">
                        <SecondaryButton type="button" onClick={() => setOpen(false)}>
                            Cancel
                        </SecondaryButton>
                        <PrimaryButton disabled={processing}>Save</PrimaryButton>
                    </div>
                </form>
            </Modal>
        </div>
    );
}
