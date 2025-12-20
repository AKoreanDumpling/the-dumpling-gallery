import { useRouter } from "next/router";
import { useState } from "react";
import useKeypress from "react-use-keypress";
import type { ImageProps } from "../utils/types";
import SharedModal from "./SharedModal";

export default function PrivateCarousel({
	currentPhoto,
	index,
}: {
	currentPhoto: ImageProps;
	index: number;
}) {
	const router = useRouter();
	const [direction, setDirection] = useState(0);
	const [curIndex, setCurIndex] = useState(index);

	function changePhotoId(newVal: number) {
		if (newVal > index) {
			setDirection(1);
		} else {
			setDirection(-1);
		}
		setCurIndex(newVal);
		router.push(`/private/p/${newVal}`);
	}

	useKeypress("ArrowRight", () => {
		changePhotoId(index + 1);
	});

	useKeypress("ArrowLeft", () => {
		if (index > 0) {
			changePhotoId(index - 1);
		}
	});

	return (
		<div className="fixed inset-0 flex items-center justify-center">
			<SharedModal
				index={curIndex}
				direction={direction}
				changePhotoId={changePhotoId}
				currentPhoto={currentPhoto}
				closeModal={() => router.push("/private")}
				navigation={false}
			/>
		</div>
	);
}