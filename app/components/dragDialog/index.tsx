import * as React from "react";
import * as ReactDOM from "react-dom";
import CloseSvg from "../../assets/btn-close.svg";
import "./style.less";
interface Props {
    onClose: (errQuit: boolean) => void;
}

const Dialog: React.FC<Props> = (props) => {
    const { children, onClose } = props;
    const containerRef = React.useRef<HTMLDivElement>(null);
    const headerRef = React.useRef<HTMLDivElement>(null);
    const bgRef = React.useRef<HTMLDivElement>(null);
    React.useEffect(() => {
        let offsetLeft, offestTop, containerHeight, containerWidth;
        const onMoseMove = (evt: MouseEvent) => {
            const newL = Math.min(
                Math.max(0, evt.pageX - offsetLeft),
                document.body.clientWidth - containerWidth
            );
            const newT = Math.min(
                Math.max(0, evt.pageY - offestTop),
                document.body.clientHeight - containerHeight
            );

            containerRef.current.setAttribute(
                "style",
                `left: ${newL}px;top: ${newT}px`
            );
        };
        document.addEventListener("mouseup", () => {
            document.removeEventListener("mousemove", onMoseMove);
        });
        headerRef.current.addEventListener("mousedown", (e) => {
            const {
                top,
                left,
                width,
                height
            } = containerRef.current.getBoundingClientRect();
            containerHeight = height;
            containerWidth = width;
            offestTop = e.pageY - top;
            offsetLeft = e.pageX - left;
            document.addEventListener("mousemove", onMoseMove);
        });
    }, []);

    return (
        <div
            ref={bgRef}
            className="dialog-bg"
            onClick={(e) => {
                const el = bgRef.current.querySelector<HTMLDivElement>(
                    ".dialog-container"
                );
                el.className = "dialog-container dialog-alert";
                setTimeout(() => {
                    el.className = "dialog-container";
                }, 200);
            }}
        >
            <div
                className="dialog-container"
                ref={containerRef}
                onClick={(e) => {
                    e.stopPropagation();
                    e.nativeEvent.stopImmediatePropagation();
                }}
            >
                <div className="header" ref={headerRef}>
                    Makkii Connect
                    <CloseSvg
                        className="btn-close"
                        onClick={() => onClose(true)}
                    />
                </div>
                <div className="dialog children">{children}</div>
            </div>
        </div>
    );
};

export const dialogContext = React.createContext({
    onClose: (errQuit: boolean) => {}
});

export const showDialog = (
    dialog: React.ReactNode,
    callback: (success: any, err?: string) => any
) => {
    const root = document.body;

    const div = document.createElement("div");
    div.className = "dialog-root";

    root.appendChild(div);
    const onClose = (cancel: boolean) => {
        ReactDOM.unmountComponentAtNode(div);
        if (div && div.parentNode) {
            div.parentNode.removeChild(div);
        }
        if (cancel) {
            callback(null, "canceled");
        }
    };
    ReactDOM.render(
        <Dialog onClose={onClose}>
            <dialogContext.Provider value={{ onClose: onClose }}>
                {dialog}
            </dialogContext.Provider>
        </Dialog>,
        div
    );
};
