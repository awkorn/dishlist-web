import React from "react";
import Logo from "./Logo";
import SearchBar from "./SearchBar";
import NavButtons from "./NavButtons";
import UserMenu from "./UserMenu";

const TopNav = ({pageType}) => {

    return(
        <div>
            <Logo />
            <SearchBar pageType={pageType}/>
            <NavButtons />
            <UserMenu />
        </div>
    )
}

export default TopNav;

