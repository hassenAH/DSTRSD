import { Link } from "react-router-dom";

export default function Home() {
  return (
    <div className="text-center">
      <h1 className="text-4xl font-bold text-blue-600">Home Page</h1>
      <Link to="/about" className="mt-6 inline-block text-lg text-blue-500 underline">
        Go to About →
      </Link>
    </div>
  );
}
