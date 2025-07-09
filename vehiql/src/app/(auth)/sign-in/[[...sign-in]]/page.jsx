import React from "react";
import { SignIn } from "@clerk/nextjs";

const SignInPage = () => {
  return <SignIn />;
};

export default SignInPage;

// [[...sign-in]] --> sets the optional catch all segments in next js
// so it allows sign-in/sadasd/asd/asdasd etc types of routes
