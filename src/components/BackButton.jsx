import { Link } from "react-router-dom";
import { IoArrowBack } from "react-icons/io5";

export default function BackButton() {
  return (
    <Link to="/" className="back-button">
      <IoArrowBack size={22} />
    </Link>
  );
}
