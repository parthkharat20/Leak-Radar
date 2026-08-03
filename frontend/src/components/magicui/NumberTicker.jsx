import { useEffect, useRef } from "react";
import { useInView, useMotionValue, useSpring } from "motion/react";
import { cn } from "../../lib/utils";

export function NumberTicker({
  value,
  direction = "up",
  delay = 0,
  className,
  decimalPlaces = 0,
  prefix = "",
  suffix = "",
}) {
  const ref = useRef(null);
  const numericValue = typeof value === "number" ? value : parseFloat(String(value).replace(/[^0-9.-]+/g, "")) || 0;
  const motionValue = useMotionValue(direction === "down" ? numericValue : 0);
  const springValue = useSpring(motionValue, {
    damping: 30,
    stiffness: 100,
  });
  const isInView = useInView(ref, { once: true, margin: "0px" });

  useEffect(() => {
    if (isInView) {
      const timer = setTimeout(() => {
        motionValue.set(direction === "down" ? 0 : numericValue);
      }, delay * 1000);
      return () => clearTimeout(timer);
    }
  }, [motionValue, isInView, delay, numericValue, direction]);

  useEffect(() => {
    return springValue.on("change", (latest) => {
      if (ref.current) {
        const formatted = Intl.NumberFormat("en-IN", {
          minimumFractionDigits: decimalPlaces,
          maximumFractionDigits: decimalPlaces,
        }).format(Number(latest.toFixed(decimalPlaces)));
        ref.current.textContent = `${prefix}${formatted}${suffix}`;
      }
    });
  }, [springValue, decimalPlaces, prefix, suffix]);

  return (
    <span
      className={cn("inline-block font-mono tracking-tight tabular-nums", className)}
      ref={ref}
    >
      {prefix}{Intl.NumberFormat("en-IN").format(numericValue)}{suffix}
    </span>
  );
}
