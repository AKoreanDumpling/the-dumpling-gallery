import { createGlobalState } from "react-hooks-global-state";

const initialState = { privatePhotoId: 0 };
const { useGlobalState } = createGlobalState(initialState);

export const usePrivateLastViewedPhoto = () => {
	return useGlobalState("privatePhotoId");
};