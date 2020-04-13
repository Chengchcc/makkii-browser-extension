import * as React from "react";
import Header from "./header";
const Layout: React.FC = (props) => {
    return (
        <>
            <Header />
            {props.children}
        </>
    );
};

export default Layout;
