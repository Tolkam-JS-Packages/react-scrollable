import * as React from 'react';
import { Children, cloneElement, isValidElement, PureComponent, SyntheticEvent } from 'react';
import scrollTo, { TEasing } from '@tolkam/lib-scroll-to';

class Scrollable extends PureComponent<IProps> {

    public static defaultProps = {
        scrollIntoView: true,
        scrollTriggerEvent: 'click',
        scrollSpeed: 200,
        scrollEasing: 'easeInQuad',
        withStyles: true,
    };

    /**
     * @type HTMLDivElement
     */
    protected outer: HTMLDivElement;

    /**
     * @type HTMLDivElement
     */
    protected inner: HTMLDivElement;

    /**
     * @type HTMLCollection
     */
    protected children: HTMLCollection;

    /**
     * @inheritDoc
     */
    public componentDidMount(): void {
        const that = this;
        const scrollIntoView = that.props.scrollIntoView;
        if(scrollIntoView !== undefined) {
            that.listen();
            typeof scrollIntoView !== 'boolean'
                && setTimeout(() => that.scrollTo(scrollIntoView, false), 0);
        }
    }

    /**
     * @inheritDoc
     */
    public componentWillUnmount(): void {
        this.props.scrollIntoView && this.listen(true);
    }

    /**
     * Scrolls child into view
     *
     * @param nameOrIndex
     * @param animate
     */
    public scrollTo = (nameOrIndex: string | number, animate: boolean = true) => {
        const that = this;
        const { outer, inner, props } = that;
        const method = typeof nameOrIndex === 'string' ? 'namedItem' : 'item';
        const child = inner.children[method](nameOrIndex as never) as HTMLElement;

        if(!child) {
            return;
        }

        // scroll child into center
        const scrollPos = (child.offsetWidth / 2 + child.offsetLeft)
            - (outer.offsetWidth / 2);
        const speed = animate ? props.scrollSpeed : 0;

        scrollTo('Left', outer, scrollPos, speed, props.scrollEasing);
    };

    /**
     * @inheritDoc
     */
    public render() {
        const that = this;
        const props = that.props;
        const child = Children.only(props.children);

        if(!isValidElement(child)) {
            return null;
        }

        const innerProps = {
            ...child.props,
            ref: (r: HTMLDivElement) => that.inner = r,
            style: {whiteSpace: 'nowrap'},
        };

        const outerProps = {
            ref: (r: HTMLDivElement) => that.outer = r,
        };

        if(props.withStyles) {
            innerProps['style'] = {whiteSpace: 'nowrap'};
            outerProps['style'] = {overflow:'auto', maxWidth: '100%'};
        }

        return <div {...outerProps}>{cloneElement(child, innerProps)}</div>;
    }

    /**
     * Setup listeners
     *
     * @param destroy
     */
    protected listen(destroy: boolean = false) {
        const that = this;
        const {inner, props} = that;
        const eventAction = destroy ? 'remove' : 'add';
        const suf = 'EventListener';

        for (const child of inner.children) {
            child[eventAction + suf](props.scrollTriggerEvent!, that.onTrigger);
        }
    }

    /**
     * Handles child trigger event
     *
     * @param e
     */
    protected onTrigger = (e: SyntheticEvent<Event>) => {

        const that = this;
        const children = that.inner.children;
        for (const i in children) {
            if(e.target === children[i]) {
                that.scrollTo(parseInt(i));
            }
        }
    };
}

interface IProps {
    scrollIntoView?: boolean | string | number;
    scrollTriggerEvent?: string;
    scrollSpeed?: number;
    scrollEasing?: TEasing;
    withStyles?: boolean;
}

export default Scrollable;
