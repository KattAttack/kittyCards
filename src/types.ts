export interface IKittyImage {
  src: string;
  id: number;
}

export interface IState {
  kittyImageSrcs: string[];
  kittyImages: IKittyImage[];
  kittyCache: IKittyImage[];

  id: number;
  currentPage: number;
  imagesPerPage: number;
}
