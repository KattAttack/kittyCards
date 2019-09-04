import * as React from "react";
import * as ReactDOM from "react-dom";
import NodeGroup from "react-move/NodeGroup";
import catButton from "./images/buttons/catButton.jpg";
import undoButton from "./images/buttons/undoButton.png";
import "./styles.scss";

class App extends React.Component {
	constructor(props) {
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

	nextPage(number) {
		// console.log("Clicked PageNumber", number);
		this.setState({
			currentPage: number
		});
	}

	async componentDidMount() {
		let kittyImageSrcs = [];
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
			if (kittyImages.length / 5 === 0) {
				this.setState({
					kittyImageSrcs: kittyImageSrcs.filter((_, index) => index !== num),
					kittyImages: allKittyImages,
					id: id + 1,
					currentPage: 1
				});
			}
			this.setState({
				kittyImageSrcs: kittyImageSrcs.filter((_, index) => index !== num),
				kittyImages: allKittyImages,
				id: id + 1
			});
		}
	}

	cacheKittyPic(image) {
		let pageNumber;
		const { kittyCache, kittyImages } = this.state;

		let newKittyImages = [];

		kittyImages.forEach(item => {
			if (item.src !== image.src) {
				newKittyImages.push(item);
			} else {
				kittyCache.push(image);
			}
		});

		if (newKittyImages.length % 5 === 0) {
			pageNumber = newKittyImages.length / 5;
			// console.log("newKittyImages", newKittyImages);
			// console.log("pageNumber", pageNumber);
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

		let pageNumber;
		if (kittyImages.length <= 4) {
			pageNumber = 1;
		} else {
			pageNumber = this.state.currentPage;
		}

		const lastCached = kittyCache[kittyCache.length - 1];
		const newKittyImage = lastCached;
		const allKittyImages = [...kittyImages, newKittyImage];
		allKittyImages.sort(function(a, b) {
			return a.id - b.id;
		});

		const newKittyCache = [];
		kittyCache.forEach(item => {
			if (item !== lastCached) {
				newKittyCache.push(item);
			}
		});

		this.setState(
			{
				kittyImages: allKittyImages,
				kittyCache: newKittyCache,
				currentPage: pageNumber
			}
			// console.log("Current Page", this.state.currentPage)
		);
	}

	render() {
		// console.log("State", this.state);
		const { kittyImages, kittyCache, currentPage, imagesPerPage } = this.state;

		const indexOfLastImage = currentPage * imagesPerPage;
		const indexOfFirstImage = indexOfLastImage - imagesPerPage;
		const currentImages = kittyImages.slice(indexOfFirstImage, indexOfLastImage);

		return (
			<div className='App'>
				<h1>React Move Demo</h1>
				<h2>Press the kitty button for kitties!</h2>

				<PageNumbers
					nextPage={this.nextPage}
					kittyImages={kittyImages}
					imagesPerPage={imagesPerPage}
				/>

				<div className='container'>
					<div className='top'>
						<img
							className='buttonImg'
							src={catButton}
							alt='Cat Button'
							onClick={e => this.addKittyPic()}
						/>
						<TopCards
							currentImages={currentImages}
							cacheKittyPic={this.cacheKittyPic}
						/>
					</div>

					<div className='bottom'>
						<img
							className='buttonImg'
							src={undoButton}
							alt='Undo Button'
							onClick={e => this.recallKittyPic()}
						/>

						<BottomCards kittyCache={kittyCache} />
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
			<NodeGroup
				data={currentImages}
				keyAccessor={d => d.id}
				start={() => ({
					opacity: 0,
					width: 0
				})}
				enter={d => [
					{
						opacity: [1],
						timing: { duration: 400, delay: 150 }
					},
					{
						width: [306],
						timing: { duration: 400 }
					}
				]}
				update={d => [
					{
						width: [306],
						timing: { duration: 150 }
					}
				]}
				leave={() => [
					{
						opacity: [0],
						timing: { duration: 400 }
					},
					{
						width: [0],
						timing: { duration: 400 }
					}
				]}
			>
				{nodes => (
					<>
						{nodes.map(({ key, data, state }) => {
							const { opacity, width } = state;
							const widthString = `${width}px`;

							return (
								<img
									style={{ opacity, width: widthString }}
									key={key}
									src={data.src}
									alt='Kitty Pic'
									onClick={e => cacheKittyPic(data)}
								/>
							);
						})}
					</>
				)}
			</NodeGroup>
		</div>
	);
}

function BottomCards(props) {
	const { kittyCache } = props;

	return (
		<div className='bottomCards'>
			{kittyCache
				.slice()
				.reverse()
				.slice(0, 5)
				.map((image, index) => {
					return <img key={index} src={image.src} alt='Kitty Cache Pic' />;
				})}
		</div>
	);
}
