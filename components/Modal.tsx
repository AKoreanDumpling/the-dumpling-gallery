import { Dialog } from "@headlessui/react";
import { motion } from "framer-motion";
import { useRouter } from "next/router";
import { useRef, useState } from "react";
import useKeypress from "react-use-keypress";
import type { ImageProps } from "../utils/types";
import SharedModal from "./SharedModal";

export default function Modal({
	images,
	onClose,
}: {
	images: ImageProps[];
	onClose?: () => void;
}) {
	let overlayRef = useRef();
	const router = useRouter();

	const { photoId } = router.query;
	let index = Number(photoId);

	const [direction, setDirection] = useState(0);
	const [curIndex, setCurIndex] = useState(index);

	function handleClose() {
		router.push("/", undefined, { shallow: true });
		onClose();
	}

	function changePhotoId(newVal: number) {
		if (newVal > index) {
			setDirection(1);
		} else {
			setDirection(-1);
		}
		setCurIndex(newVal);
		router.push(
			`/?photoId=${newVal}`,
			`/p/${newVal}`,
			{ shallow: true },
		);
	}

	useKeypress("ArrowRight", () => {
		if (index + 1 < images.length) {
			changePhotoId(index + 1);
		}
	});

	useKeypress("ArrowLeft", () => {
		if (index > 0) {
			changePhotoId(index - 1);
		}
	});

	return (
		<Dialog
			static
			open={true}
			onClose={handleClose}
			initialFocus={overlayRef}
			className="fixed inset-0 z-10 flex items-center justify-center"
		>
			<Dialog.Overlay
				ref={overlayRef}
				as={motion.div}
				key="backdrop"
				className="fixed inset-0 z-30 flex items-center justify-center bg-black/70 backdrop-blur-2xl"
				initial={{ opacity: 0 }}
				animate={{ opacity: 1 }}
				exit={{ opacity: 0 }}
				transition={{ duration: 0.3 }}
			>
				<motion.div
					initial={{ opacity: 0 }}
					animate={{ opacity: 1 }}
					exit={{ opacity: 0 }}
					transition={{ duration: 0.3 }}
					className="relative z-50 flex h-full w-full items-center justify-center pointer-events-none"
					onClick={(e) => e.stopPropagation()}
				>
					<SharedModal
						index={curIndex}
						direction={direction}
						images={images}
						changePhotoId={changePhotoId}
						closeModal={handleClose}
						navigation={true}
					/>
				</motion.div>
			</Dialog.Overlay>
		</Dialog>
	);
}
