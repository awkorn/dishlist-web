import React from "react";
import TopNav from "../components/TopNav/TopNav";
import PageTitle from "../components/PageTitle/PageTitle";
import DishListTile from "../components/DishListTile/DishListTile";

const DishListsPage = () => {
  return (
    <>
      <TopNav pageType="dishlists"></TopNav>
      <PageTitle title="DishLists"></PageTitle>
      <DishListTile></DishListTile>
    </>
  );
};

export default DishListsPage;
