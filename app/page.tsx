import { redirect } from "next/navigation";

const HomePage = async () => {
  redirect("/feed");
};

export default HomePage;
