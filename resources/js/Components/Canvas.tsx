import {
    forwardRef,
    PointerEvent as ReactPointerEvent,
    useEffect,
    useImperativeHandle,
    useRef,
    useState,
} from 'react';

export type CanvasHandle = {
    exportImage: () => string;
};

type Tool = 'pencil' | 'brush' | 'eraser' | 'rectangle' | 'circle' | 'line' | 'sticker';

const COLORS = ['#1f2937', '#ef4444', '#f97316', '#eab308', '#22c55e', '#0ea5e9', '#6366f1', '#ec4899', '#ffffff'];
const STICKERS = ['⭐', '🌈', '🐶', '🐱', '🌸', '☀️', '❤️', '🎈'];

const WIDTH = 640;
const HEIGHT = 480;

function drawTemplate(
    ctx: CanvasRenderingContext2D,
    templateType?: 'trace_letter' | 'trace_number' | 'trace_shape' | null,
    templateText?: string | null,
) {
    if (!templateType || !templateText) {
        return;
    }

    ctx.save();
    ctx.strokeStyle = '#d1d5db';
    ctx.fillStyle = '#d1d5db';
    ctx.lineWidth = 3;

    if (templateType === 'trace_shape') {
        const cx = WIDTH / 2;
        const cy = HEIGHT / 2;
        const size = Math.min(WIDTH, HEIGHT) * 0.3;

        ctx.beginPath();
        switch (templateText.toLowerCase()) {
            case 'square':
                ctx.rect(cx - size, cy - size, size * 2, size * 2);
                break;
            case 'triangle':
                ctx.moveTo(cx, cy - size);
                ctx.lineTo(cx + size, cy + size);
                ctx.lineTo(cx - size, cy + size);
                ctx.closePath();
                break;
            case 'star': {
                const spikes = 5;
                const outer = size;
                const inner = size / 2.5;
                ctx.moveTo(cx, cy - outer);
                for (let i = 0; i < spikes; i++) {
                    const angleOuter = (Math.PI / spikes) * (2 * i + 1) - Math.PI / 2;
                    const angleInner = (Math.PI / spikes) * (2 * i + 2) - Math.PI / 2;
                    ctx.lineTo(cx + Math.cos(angleOuter) * inner, cy + Math.sin(angleOuter) * inner);
                    ctx.lineTo(cx + Math.cos(angleInner) * outer, cy + Math.sin(angleInner) * outer);
                }
                ctx.closePath();
                break;
            }
            default:
                ctx.arc(cx, cy, size, 0, Math.PI * 2);
        }
        ctx.stroke();
    } else {
        ctx.font = `bold ${HEIGHT * 0.6}px sans-serif`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(templateText, WIDTH / 2, HEIGHT / 2);
    }

    ctx.restore();
}

const Canvas = forwardRef<
    CanvasHandle,
    { templateType?: 'trace_letter' | 'trace_number' | 'trace_shape' | null; templateText?: string | null }
>(function Canvas({ templateType, templateText }, ref) {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const drawing = useRef(false);
    const startPoint = useRef<{ x: number; y: number } | null>(null);
    const snapshotBeforeShape = useRef<string | null>(null);

    const [tool, setTool] = useState<Tool>('pencil');
    const [color, setColor] = useState(COLORS[0]);
    const [brushSize, setBrushSize] = useState(6);
    const [selectedSticker, setSelectedSticker] = useState(STICKERS[0]);
    const [history, setHistory] = useState<string[]>([]);
    const [historyIndex, setHistoryIndex] = useState(-1);

    const baseImageRef = useRef<string | null>(null);

    useImperativeHandle(ref, () => ({
        exportImage: () => canvasRef.current?.toDataURL('image/png') ?? '',
    }));

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) {
            return;
        }

        const ctx = canvas.getContext('2d');
        if (!ctx) {
            return;
        }

        ctx.fillStyle = '#ffffff';
        ctx.fillRect(0, 0, WIDTH, HEIGHT);
        drawTemplate(ctx, templateType, templateText);

        const base = canvas.toDataURL('image/png');
        baseImageRef.current = base;
        setHistory([base]);
        setHistoryIndex(0);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const pushHistory = () => {
        const canvas = canvasRef.current;
        if (!canvas) {
            return;
        }

        const snapshot = canvas.toDataURL('image/png');
        setHistory((prev) => {
            const truncated = prev.slice(0, historyIndex + 1);
            return [...truncated, snapshot];
        });
        setHistoryIndex((i) => i + 1);
    };

    const restoreSnapshot = (dataUrl: string) => {
        const canvas = canvasRef.current;
        const ctx = canvas?.getContext('2d');
        if (!canvas || !ctx) {
            return;
        }

        const img = new Image();
        img.onload = () => {
            ctx.clearRect(0, 0, WIDTH, HEIGHT);
            ctx.drawImage(img, 0, 0);
        };
        img.src = dataUrl;
    };

    const undo = () => {
        if (historyIndex <= 0) {
            return;
        }

        const newIndex = historyIndex - 1;
        setHistoryIndex(newIndex);
        restoreSnapshot(history[newIndex]);
    };

    const redo = () => {
        if (historyIndex >= history.length - 1) {
            return;
        }

        const newIndex = historyIndex + 1;
        setHistoryIndex(newIndex);
        restoreSnapshot(history[newIndex]);
    };

    const clear = () => {
        if (!baseImageRef.current) {
            return;
        }

        restoreSnapshot(baseImageRef.current);
        pushHistoryDelayed();
    };

    const pushHistoryDelayed = () => {
        window.setTimeout(pushHistory, 30);
    };

    const getPoint = (e: ReactPointerEvent<HTMLCanvasElement>) => {
        const rect = e.currentTarget.getBoundingClientRect();
        return {
            x: ((e.clientX - rect.left) / rect.width) * WIDTH,
            y: ((e.clientY - rect.top) / rect.height) * HEIGHT,
        };
    };

    const handlePointerDown = (e: ReactPointerEvent<HTMLCanvasElement>) => {
        const canvas = canvasRef.current;
        const ctx = canvas?.getContext('2d');
        if (!canvas || !ctx) {
            return;
        }

        const point = getPoint(e);

        if (tool === 'sticker') {
            ctx.font = '48px sans-serif';
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.fillText(selectedSticker, point.x, point.y);
            pushHistoryDelayed();
            return;
        }

        drawing.current = true;
        startPoint.current = point;

        if (['rectangle', 'circle', 'line'].includes(tool)) {
            snapshotBeforeShape.current = canvas.toDataURL('image/png');
            return;
        }

        ctx.beginPath();
        ctx.moveTo(point.x, point.y);
    };

    const handlePointerMove = (e: ReactPointerEvent<HTMLCanvasElement>) => {
        if (!drawing.current) {
            return;
        }

        const canvas = canvasRef.current;
        const ctx = canvas?.getContext('2d');
        if (!canvas || !ctx || !startPoint.current) {
            return;
        }

        const point = getPoint(e);

        if (tool === 'pencil' || tool === 'brush' || tool === 'eraser') {
            ctx.lineCap = 'round';
            ctx.lineJoin = 'round';
            ctx.lineWidth = tool === 'eraser' ? brushSize * 3 : tool === 'brush' ? brushSize * 2 : brushSize;
            ctx.strokeStyle = tool === 'eraser' ? '#ffffff' : color;
            ctx.lineTo(point.x, point.y);
            ctx.stroke();
            return;
        }

        if (snapshotBeforeShape.current) {
            const img = new Image();
            img.onload = () => {
                ctx.clearRect(0, 0, WIDTH, HEIGHT);
                ctx.drawImage(img, 0, 0);
                ctx.lineWidth = brushSize;
                ctx.strokeStyle = color;

                if (tool === 'line') {
                    ctx.beginPath();
                    ctx.moveTo(startPoint.current!.x, startPoint.current!.y);
                    ctx.lineTo(point.x, point.y);
                    ctx.stroke();
                } else if (tool === 'rectangle') {
                    ctx.strokeRect(
                        startPoint.current!.x,
                        startPoint.current!.y,
                        point.x - startPoint.current!.x,
                        point.y - startPoint.current!.y,
                    );
                } else if (tool === 'circle') {
                    const radius = Math.hypot(point.x - startPoint.current!.x, point.y - startPoint.current!.y);
                    ctx.beginPath();
                    ctx.arc(startPoint.current!.x, startPoint.current!.y, radius, 0, Math.PI * 2);
                    ctx.stroke();
                }
            };
            img.src = snapshotBeforeShape.current;
        }
    };

    const handlePointerUp = () => {
        if (!drawing.current) {
            return;
        }

        drawing.current = false;
        startPoint.current = null;
        snapshotBeforeShape.current = null;
        pushHistoryDelayed();
    };

    return (
        <div>
            <div className="mb-4 flex flex-wrap items-center justify-center gap-2">
                {(['pencil', 'brush', 'eraser', 'line', 'rectangle', 'circle'] as Tool[]).map((t) => (
                    <button
                        key={t}
                        onClick={() => setTool(t)}
                        className={`rounded-full px-3 py-2 text-sm font-semibold capitalize ${
                            tool === t ? 'bg-sky-600 text-white' : 'bg-white text-gray-600 shadow-sm'
                        }`}
                    >
                        {t}
                    </button>
                ))}
                <button onClick={undo} className="rounded-full bg-white px-3 py-2 text-sm font-semibold text-gray-600 shadow-sm">
                    ↩️ Undo
                </button>
                <button onClick={redo} className="rounded-full bg-white px-3 py-2 text-sm font-semibold text-gray-600 shadow-sm">
                    ↪️ Redo
                </button>
                <button onClick={clear} className="rounded-full bg-white px-3 py-2 text-sm font-semibold text-gray-600 shadow-sm">
                    🗑️ Clear
                </button>
            </div>

            <div className="mb-4 flex flex-wrap items-center justify-center gap-4">
                <div className="flex gap-1.5">
                    {COLORS.map((c) => (
                        <button
                            key={c}
                            onClick={() => setColor(c)}
                            className={`h-8 w-8 rounded-full border-2 ${color === c ? 'border-sky-600' : 'border-gray-200'}`}
                            style={{ backgroundColor: c }}
                        />
                    ))}
                </div>

                <label className="flex items-center gap-2 text-sm text-gray-600">
                    Size
                    <input
                        type="range"
                        min={2}
                        max={30}
                        value={brushSize}
                        onChange={(e) => setBrushSize(Number(e.target.value))}
                    />
                </label>
            </div>

            <div className="mb-4 flex flex-wrap items-center justify-center gap-2">
                {STICKERS.map((sticker) => (
                    <button
                        key={sticker}
                        onClick={() => {
                            setTool('sticker');
                            setSelectedSticker(sticker);
                        }}
                        className={`rounded-full p-2 text-2xl ${
                            tool === 'sticker' && selectedSticker === sticker ? 'bg-sky-100' : 'bg-white shadow-sm'
                        }`}
                    >
                        {sticker}
                    </button>
                ))}
            </div>

            <canvas
                ref={canvasRef}
                width={WIDTH}
                height={HEIGHT}
                onPointerDown={handlePointerDown}
                onPointerMove={handlePointerMove}
                onPointerUp={handlePointerUp}
                onPointerLeave={handlePointerUp}
                className="mx-auto touch-none rounded-2xl bg-white shadow-md"
                style={{ width: '100%', maxWidth: WIDTH, height: 'auto', aspectRatio: `${WIDTH} / ${HEIGHT}` }}
            />
        </div>
    );
});

export default Canvas;
