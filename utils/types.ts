/* eslint-disable no-unused-vars */
export interface ImageProps {
	id: number;
	height: string;
	width: string;
	public_id: string;
	format: string;
	resource_type?: string;
	blurDataUrl?: string;
	signedUrl?: string;
	signedPosterUrl?: string;
	signedThumbnailUrls?: Record<string, string>;
	signedPosterThumbnailUrls?: Record<string, string>;
}

export interface SharedModalProps {
	index: number;
	images?: ImageProps[];
	currentPhoto?: ImageProps;
	changePhotoId: (newVal: number) => void;
	closeModal: () => void;
	navigation: boolean;
	uiVisible?: boolean;
	useSharedLayout?: boolean;
	hideActiveMedia?: boolean;
	onMediaElementChange?: (element: HTMLElement | null) => void;
	direction?: number;
	basePath?: string;
}
