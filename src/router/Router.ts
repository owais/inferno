import Component from 'inferno-component';
import { createVNode } from 'inferno';
import RouterContext from './RouterContext';
import match, { matchPath } from './match';

export interface IRouterProps {
	history?: any;
	children?: any;
	router: any;
	location: any;
	component?: Component<any, any>;
}

function createrRouter(history) {
	if (!history) {
		throw new TypeError('Inferno: Error "inferno-router" requires a history prop passed');
	}
	return {
		push: history.push,
		replace: history.replace,
		listen: history.listen,
		isActive(url) {
			return matchPath(true, url, this.url);
		},
		get location() {
			return history.location.pathname !== 'blank' ? history.location : {
				pathname: '/',
				search: ''
			};
		},
		get url() {
			return this.location.pathname + this.location.search;
		}
	};
}

export default class Router extends Component<IRouterProps, any> {
	router: any;
	unlisten: any;

	constructor(props?: any, context?: any) {
		super(props, context);
		this.router = createrRouter(props.history);
		this.state = {
			url: props.url || this.router.url
		};
	}

	componentWillMount() {
		if (this.router) {
			this.unlisten = this.router.listen((url) => {
				this.routeTo(url.pathname);
			});
		}
	}

	componentWillReceiveProps(nextProps) {
		this.setState({
			url: nextProps.url
		});
	}

	componentWillUnmount() {
		if (this.unlisten) {
			this.unlisten();
		}
	}

	routeTo(url) {
			this.setState({ url });
	}

	render(props) {
		const hit = match(props.children, this.state.url);

		if (hit.redirect) {
			return process.nextTick(() => {
				this.router.replace(hit.redirect);
			});
		}

		return createVNode(VNodeFlags.ComponentClass, RouterContext, {
			location: this.state.url,
			router: this.router,
			matched: hit.matched
		});
	}
}
