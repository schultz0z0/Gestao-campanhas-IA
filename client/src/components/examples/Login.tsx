import Login from "../../pages/Login";

export default function LoginExample() {
  return <Login onLogin={(email) => console.log("Logged in as:", email)} />;
}
