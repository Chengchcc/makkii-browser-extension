import * as React from "react";
import "./style.less";
import NoAccountsSvg from "../../assets/no-accounts.svg";
type Sections<H, T> = Array<{ key: H; data: Array<T> }>;

interface Props<H, T> {
    className?: string;
    sections: Sections<H, T>;
    renderItem: (data: T, key?: H) => React.ReactElement;
}

type SectionListEl<H = any, T = any> = React.FC<Props<H, T>>;

const SectionList: SectionListEl = (props) => {
    const { sections, renderItem, className } = props;
    const els = sections.map((sec, idx) => {
        const ll = sec.data.map((dat, idxx) => {
            return <li key={idxx}>{renderItem(dat, sec.key)}</li>;
        });
        const show = () => {
            const sectionEls = document.querySelectorAll("section")[idx];
            const visible = sectionEls.className !== "hide";
            console.log("try visible", visible);
            const img = sectionEls.querySelector<HTMLImageElement>(
                ".btn-arrow"
            );
            if (!visible) {
                sectionEls.className = "show";
                img.src = "../../assets/icon_toggle.png";
            } else {
                sectionEls.className = "hide";
                img.src = "../../assets/icon_expand.png";
            }
        };
        return (
            <section style={{ position: "relative" }} key={idx}>
                <div className="section-title" onClick={show}>
                    <span>{sec.key}</span>
                    <img
                        className={"btn-arrow"}
                        src={"../../assets/icon_toggle.png"}
                    />
                </div>
                <ul>{ll}</ul>
            </section>
        );
    });

    return (
        <div className={`section-list ${className}`}>
            {els.length ? (
                els
            ) : (
                <>
                    <NoAccountsSvg className="no-accounts" />
                    <div className="hint">No Accounts Found</div>
                </>
            )}
        </div>
    );
};

export default SectionList;
