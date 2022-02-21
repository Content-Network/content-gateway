import { JSX } from "@emotion/react/types/jsx-runtime";
import { FunctionComponent } from "react";
import Nav from "../sections/Nav";

type LayoutProps = {
    children: JSX.Element;
};

const Layout = ({ children }:LayoutProps) => {
    return (
        <>
            <Nav />
            {children}
        </>
    );
};

export default Layout;
