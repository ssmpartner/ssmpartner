import { useState, useCallback } from "react";
import { cn } from "@/lib/utils";

interface ProgressiveImageProps extends React.ImgHTMLAttributes<HTMLImageElement> {
  /** Optional wrapper className for the container div */
  containerClassName?: string;
}

/**
 * Displays a neutral bg-muted placeholder until the image is fully loaded.
 * Prevents broken / AI-generated / stale images from flashing.
 */
const ProgressiveImage = ({
  src,
  alt,
  className,
  containerClassName,
  loading,
  ...rest
}: ProgressiveImageProps) => {
  const [loaded, setLoaded] = useState(false);
  const [error, setError] = useState(false);

  const handleLoad = useCallback(() => setLoaded(true), []);
  const handleError = useCallback(() => {
    setError(true);
    setLoaded(true); // hide spinner even on error
  }, []);

  // Reset state when src changes
  const [prevSrc, setPrevSrc] = useState(src);
  if (src !== prevSrc) {
    setPrevSrc(src);
    setLoaded(false);
    setError(false);
  }

  if (!src) {
    return <div className={cn("bg-muted", containerClassName || className)} />;
  }

  return (
    <div className={cn("relative overflow-hidden", containerClassName)}>
      {/* Grey placeholder – visible until image loads */}
      {!loaded && (
        <div className="absolute inset-0 bg-muted animate-pulse" />
      )}

      {/* Actual image – hidden until onLoad fires */}
      {!error && (
        <img
          src={src}
          alt={alt}
          className={cn(
            className,
            "transition-opacity duration-500",
            loaded ? "opacity-100" : "opacity-0"
          )}
          loading={loading}
          onLoad={handleLoad}
          onError={handleError}
          {...rest}
        />
      )}
    </div>
  );
};

export default ProgressiveImage;
