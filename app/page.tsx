import { redirect } from "next/navigation";

const HomePage = async () => {
  redirect("/auth");
};

export default HomePage;
