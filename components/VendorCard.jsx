import React from "react";
import Link from "next/link";
import Image from "next/image";
import { HiOutlineArrowSmRight } from "react-icons/hi";
import { assets } from "@/assets/assets";
import { FaStar } from "react-icons/fa";

const VendorCard = ({
  _id,
  businessName,
  avatar,
  banner,
  productCount,
  averageRating,
  totalReviews,
}) => (
  <Link
    href={`/vendor/${_id}`}
    className="group block bg-white rounded-lg border  overflow-hidden shadow-sm hover:shadow-lg transition-all duration-300 ease-in-out transform hover:-translate-y-1"
  >
    <div className="relative">
      <Image
        src={banner?.url || "https://picsum.photos/seed/1/400/200"}
        alt={`${businessName}'s banner`}
        className="w-full h-24 object-cover"
        width={400}
        height={200}
      />
      <div className="absolute -bottom-10 left-1/2 -translate-x-1/2 w-20 h-20 border-4 border-white rounded-full overflow-hidden bg-gray-200">
        <Image
          src={avatar?.url || "https://i.pravatar.cc/150"}
          alt={`${businessName} logo`}
          width={80}
          height={80}
          className="object-cover w-full h-full"
        />
      </div>
    </div>
    <div className="pt-12 p-4 text-center">
      <div className="flex-grow flex flex-col justify-center mb-4">
        <h4 className="font-semibold text-lg text-gray-800">{businessName}</h4>
        <div className="flex items-center justify-center mt-2 space-x-4 text-sm text-gray-500">
          <div className="flex items-center">
            <FaStar className="text-yellow-400 mr-1" />
            <span>{(averageRating || 0).toFixed(1)}</span>
            <span className="ml-1">({totalReviews} reviews)</span>
          </div>
          <div className="flex items-center">
            <span>{productCount} products</span>
          </div>
        </div>
      </div>
      <div className="mt-2 flex items-center justify-center text-blue-600 font-medium text-sm opacity-0 group-hover:opacity-100 transition-opacity duration-300">
        Visit Store
        <HiOutlineArrowSmRight className="ml-1 h-4 w-4 transform group-hover:translate-x-1 transition-transform" />
      </div>
    </div>
  </Link>
);

export default VendorCard;
