import { Link } from "react-router-dom";
import Popup from "./components/popup/Popup";

export default function About() {
  return (
    <>
      <div className="text-center">
        <h1 className="text-4xl font-bold text-green-600">About Page</h1>
        <Link
          to="/"
          className="mt-6 inline-block text-lg text-green-500 underline"
        >
          ← Back to Home
        </Link>
      </div>

      <Popup />
    </>
  );
}
