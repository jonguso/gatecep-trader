import { useRef, useState } from "react";

export default function SwipeTradeButton({
  text = "Swipe To Buy",
  onComplete,
  color = "bg-green-500",
  disabled = false
}) {
  const [dragX, setDragX] = useState(0);
  const [completed, setCompleted] = useState(false);

  const startX = useRef(0);
  const dragging = useRef(false);

  function handleStart(clientX) {
  if (completed || disabled) return;

  dragging.current = true;
  startX.current = clientX;
}

 function handleMove(clientX) {
  if (!dragging.current || completed || disabled) return;

    const diff = clientX - startX.current;

    if (diff < 0) return;

    if (diff > 220) {
      setDragX(220);
      setCompleted(true);

      if (onComplete) {
        onComplete();
      }

      return;
    }

    setDragX(diff);
  }

  function handleEnd() {
    dragging.current = false;

    if (!completed) {
      setDragX(0);
    }
  }

  return (
    <div className="relative h-16 rounded-full bg-slate-800 overflow-hidden border border-slate-700 select-none">
      <div
        className={`absolute left-0 top-0 bottom-0 ${color} transition-all`}
        style={{
          width: completed ? "100%" : `${dragX + 60}px`
        }}
      />

      <div className="absolute inset-0 flex items-center justify-center font-bold text-white tracking-wide">
        {completed ? "Order Submitted" : text}
      </div>

      {!completed && (
        <div
          className={`absolute top-1 left-1 w-14 h-14 rounded-full ${color} flex items-center justify-center text-white font-bold shadow-xl ${
  disabled ? "cursor-not-allowed opacity-50" : "cursor-pointer"
}`}
          style={{
            transform: `translateX(${dragX}px)`
          }}
          onMouseDown={(e) =>
            handleStart(e.clientX)
          }
          onMouseMove={(e) =>
            handleMove(e.clientX)
          }
          onMouseUp={handleEnd}
          onMouseLeave={handleEnd}
          onTouchStart={(e) =>
            handleStart(
              e.touches[0].clientX
            )
          }
          onTouchMove={(e) =>
            handleMove(
              e.touches[0].clientX
            )
          }
          onTouchEnd={handleEnd}
        >
          →
        </div>
      )}
    </div>
  );
}