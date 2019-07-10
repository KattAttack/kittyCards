import * as React from "react";
import * as ReactDOM from "react-dom";
import catButton from "./images/buttons/catButton.jpg";
import undoButton from "./images/buttons/undoButton.png";
import { IState, IKittyImage } from "./types";

import "./styles.scss";

interface IProps {}

class App extends React.Component<IProps, IState> {
	constructor(props: IProps) {
		super(props);

		this.state = {
			kittyImageSrcs: [],
			kittyImages: [],
			kittyCache: [],
			id: 0,
			currentPage: 1,
			imagesPerPage: 5
		};
		this.cacheKittyPic = this.cacheKittyPic.bind(this);
		this.nextPage = this.nextPage.bind(this);
	}

	nextPage(number: number) {
		console.log("Clicked PageNumber", number);
		this.setState({
			currentPage: number
		});
	}

	async componentDidMount() {
		let kittyImageSrcs: string[] = [];
		for (var i = 1; i < 21; i++) {
			const kittyImageSrc = await import(`./images/cats/cat${i}.jpg`);
			if (kittyImageSrc) {
				kittyImageSrcs.push(kittyImageSrc.default);
			}
		}
		this.setState({
			kittyImageSrcs
		});
	}

	addKittyPic() {
		const { kittyImageSrcs, kittyImages, id } = this.state;
		const num = Math.floor(Math.random() * kittyImageSrcs.length - 1) + 1;
		const newKittyImage = {
			id,
			src: kittyImageSrcs[num]
		};

		if (kittyImageSrcs.length === 0) {
			console.log("No More Kitties :c");
		} else if (kittyImages.length <= 19) {
			const allKittyImages = [...kittyImages, newKittyImage];
			this.setState({
				kittyImageSrcs: kittyImageSrcs.filter((_, index) => index !== num),
				kittyImages: allKittyImages,
				id: id + 1
			});
		}
	}

	cacheKittyPic(image: IKittyImage) {
		console.log();
		const { kittyCache, kittyImages } = this.state;

		let newKittyImages: IKittyImage[] = [];

		kittyImages.forEach(item => {
			if (item.src !== image.src) {
				newKittyImages.push(item);
			} else {
				kittyCache.push(image);
			}
		});

		if (newKittyImages.length % 5 === 0) {
			const pageNumber = newKittyImages.length / 5;
			console.log("newKittyImages", newKittyImages);
			console.log("pageNumber", pageNumber);
			this.nextPage(pageNumber);
		}

		this.setState({
			kittyCache,
			kittyImages: newKittyImages
		});
	}

	recallKittyPic() {
		const { kittyCache, kittyImages } = this.state;

		if (kittyCache.length <= 0) return;
		const lastCached = kittyCache[kittyCache.length - 1];

		const newKittyImage = lastCached;
		const allKittyImages = [...kittyImages, newKittyImage];
		allKittyImages.sort(function(a, b) {
			return a.id - b.id;
		});

		const newKittyCache: IKittyImage[] = [];
		kittyCache.forEach(item => {
			if (item !== lastCached) {
				newKittyCache.push(item);
			}
		});

		this.setState({
			kittyImages: allKittyImages,
			kittyCache: newKittyCache
		});
	}

	render() {
		console.log("State", this.state);
		const { kittyImages, kittyCache, currentPage, imagesPerPage } = this.state;

		const indexOfLastImage = currentPage * imagesPerPage;
		const indexOfFirstImage = indexOfLastImage - imagesPerPage;
		const currentImages = kittyImages.slice(indexOfFirstImage, indexOfLastImage);

		return (
			<div className='App'>
				<h1>React Spring Transition</h1>
				<h2>Press the kitty button for kitties!</h2>

				<PageNumbers
					nextPage={this.nextPage}
					kittyImages={kittyImages}
					imagesPerPage={imagesPerPage}
				/>

				<div className='container'>
					<div className='top'>
						<img src={catButton} alt='Cat Button' onClick={e => this.addKittyPic()} />
						<TopCards
							currentImages={currentImages}
							cacheKittyPic={this.cacheKittyPic}
						/>
					</div>

					<div className='bottom'>
						<img
							src={undoButton}
							alt='Undo Button'
							onClick={e => this.recallKittyPic()}
						/>

						<div className='bottomCards'>
							{kittyCache
								.slice()
								.reverse()
								.slice(0, 5)
								.map((image, index) => {
									return (
										<img key={index} src={image.src} alt='Kitty Cache Pic' />
									);
								})}
						</div>
					</div>
				</div>
			</div>
		);
	}
}

const rootElement = document.getElementById("root");
ReactDOM.render(<App />, rootElement);

function PageNumbers(props) {
	const { nextPage, kittyImages, imagesPerPage } = props;
	const pageNumbers = [];
	for (let i = 1; i <= Math.ceil(kittyImages.length / imagesPerPage); i++) {
		pageNumbers.push(i);
	}
	return (
		<div id='page-numbers' className='pageNumbers'>
			{pageNumbers.map(number => {
				return (
					<div
						key={number}
						id={number}
						className='numbers'
						onClick={e => nextPage(number)}
					>
						{number}
					</div>
				);
			})}
		</div>
	);
}

function TopCards(props) {
	const { currentImages, cacheKittyPic } = props;

	return (
		<div className='topCards'>
			{currentImages.map((image, index) => {
				return (
					<img
						key={index}
						src={image.src}
						alt='Kitty Pic'
						onClick={e => cacheKittyPic(image)}
					/>
				);
			})}
		</div>
	);
}
