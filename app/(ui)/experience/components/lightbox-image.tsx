import Image from "next/image";
import {
    isImageFitCover, isImageSlide, useLightboxProps, useLightboxState, Slide, SlideImage,
} from "yet-another-react-lightbox";

import type { RenderSlideProps, RenderThumbnailProps } from "yet-another-react-lightbox";

interface NextJsImageSlide extends SlideImage {
    width: number;
    height: number;
    blurDataURL?: string;
}

function isLightBoxImage(slide: Slide): slide is NextJsImageSlide {
    return (
        isImageSlide(slide) &&
        typeof slide.width === "number" &&
        typeof slide.height === "number"
    );
}

type LightboxImageProps = RenderSlideProps | RenderThumbnailProps;

export default function LightboxImage(props: LightboxImageProps) {
    const { slide, rect } = props;
    const offset = 'offset' in props ? props.offset : 0;
    const {
        on: { click },
        carousel: { imageFit },
    } = useLightboxProps();

    const { currentIndex } = useLightboxState();

    const cover = isImageSlide(slide) && isImageFitCover(slide, imageFit);

    if (!isLightBoxImage(slide)) return undefined;

    const width = !cover
        ? Math.round(
            Math.min(rect.width, (rect.height / slide.height) * slide.width),
        )
        : rect.width;

    const height = !cover
        ? Math.round(
            Math.min(rect.height, (rect.width / slide.width) * slide.height),
        )
        : rect.height;

    return (
        <div style={{ position: "relative", width, height }}>
            <Image
                fill
                alt=""
                src={slide.src}
                loading="eager"
                draggable={false}
                placeholder={slide.blurDataURL ? "blur" : undefined}
                blurDataURL={slide.blurDataURL}
                style={{
                    objectFit: cover ? "cover" : "contain",
                    cursor: click ? "pointer" : undefined,
                }}
                sizes={`${Math.ceil((width / window.innerWidth) * 100)}vw`}
                onClick={
                    offset === 0 ? () => click?.({ index: currentIndex }) : undefined
                }
            />
        </div>
    );
}
