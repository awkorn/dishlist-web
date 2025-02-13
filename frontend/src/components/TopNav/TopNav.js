import React from "react";
import Logo from "./Logo";
import SearchBar from "./SearchBar";
import NavButtons from "./NavButtons";
import UserMenu from "./UserMenu";
import "./TopNav.css"

const TopNav = ({pageType}) => {

    return(
        <div className="top-nav">
            <Logo />
            <SearchBar pageType={pageType}/>
            <NavButtons />
            <UserMenu />
        </div>
    )
}

export default TopNav;

