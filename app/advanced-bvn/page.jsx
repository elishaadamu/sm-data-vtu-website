"use client";
import React from "react";
import { message } from "antd";
import Image from "next/image";
import { format } from "date-fns";
import { BsFillHandIndexThumbFill } from "react-icons/bs";
import { useRouter } from "next/navigation";

import BVNlogo from "@/app/dashboard/assets/bvn-logo.jpeg";
import Avatar from "@/app/dashboard/assets/bvn-logo.jpeg";
import Fingerprint from "@/app/dashboard/assets/finger-print.png"; // Assuming this is the correct path
import { useAppContext } from "@/context/AppContext";

function AdvancedBVNSlip() {
  const { bvnSlipData, clearBvnSlip } = useAppContext();
  const router = useRouter();

  const user = bvnSlipData || {};
  console.log("Slip Data:", bvnSlipData);

  // Use base64 image if available, else fallback
  const avatarSrc = user?.image
    ? `data:image/jpeg;base64,${user.image}`
    : Avatar;

  const handlePrint = () => {
    message.info("Printing BVN Slip...", { duration: 2 });
    const prevTitle = document.title;
    document.title = "Advanced BVN Slip";
    setTimeout(() => {
      window.print();
      setTimeout(() => {
        document.title = prevTitle;
      }, 1000);
    }, 1200);
  };

  const handleGoBack = () => {
    clearBvnSlip();
    router.back();
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-6">
      {/* Action Buttons */}
      <div className="flex gap-4 mb-4 no-print">
        <button
          onClick={handleGoBack}
          className="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600"
        >
          Go Back
        </button>
        <button
          onClick={handlePrint}
          className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
        >
          Print BVN Slip
        </button>
      </div>

      {/* Print styles */}

      <div className="w-full max-w-2xl bg-white border shadow-lg rounded-lg px-12 py-7 print-slip relative">
        <div className="flex items-center mb-4">
          <Image src={BVNlogo} alt="BVN Logo" className="w-70 h-40 mr-4" />
        </div>

        <div className="flex items-center mb-4">
          <Image
            src={avatarSrc}
            alt="User Avatar"
            width={160}
            height={160}
            className="w-40 h-auto mr-4"
          />
          <div className="flex flex-col">
            <div>
              <p className="text-gray-400 text-[17px] font-semibold">SURNAME</p>
              <p className="text-gray-900 text-[18px] font-semibold">
                {user?.personal_information?.last_name || "-"}
              </p>
            </div>
            <div className="mt-3">
              <p className="text-gray-400 text-[17px] font-semibold">
                FIRST NAME/ OTHER NAME
              </p>
              <p className="text-gray-900 text-[18px] font-semibold">
                {`${user?.personal_information?.first_name || "-"} ${
                  user?.personal_information?.middle_name || ""
                }`}
              </p>
            </div>
            <div className="flex flex-row gap-10 mt-3">
              <div>
                <p className="text-gray-400 text-[16px] font-semibold">
                  DATE OF BIRTH
                </p>
                <p className="text-gray-900 text-[18px] font-semibold">
                  {user?.personal_information?.date_of_birth || "-"}
                </p>
              </div>
              <div>
                <p className="text-gray-400 text-[16px] font-semibold">
                  GENDER
                </p>
                <p className="text-gray-900 text-[18px] font-semibold">
                  {user?.personal_information?.gender || "-"}
                </p>
              </div>
              <div>
                <p className="text-gray-400 text-[16px] font-semibold">
                  ISSUED DATE
                </p>
                <p className="text-gray-900 text-[18px] font-semibold">
                  {user?.verification_details?.verified_at
                    ? format(
                        new Date(user.verification_details.verified_at),
                        "dd/MM/yyyy"
                      )
                    : "-"}
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="flex flex-col gap-3 justify-center mt-4 text-center">
          <p className="text-gray-400 text-[18px] font-semibold">
            Bank Verification Number (BVN)
          </p>
          <p className="text-gray-900 text-3xl font-semibold">
            {user.bvn || "-"}
          </p>
        </div>

        <div className="absolute top-0 right-0 gap-2 mt-12 flex items-center justify-center">
          <BsFillHandIndexThumbFill className="w-20 h-24 text-blue-500" />
          <div>
            <Image
              src={Fingerprint}
              alt="Fingerprint"
              className="w-52 h-auto mr-4"
            />
            <p className="text-green-600 text-[20px] ml-[-20px] text-center font-semibold">
              NGA
            </p>
          </div>
        </div>
      </div>
      <style jsx>{`
        @media print {
          @page {
            size: auto;
            margin: 0;
          }
          body * {
            visibility: hidden !important;
          }
          .print-slip,
          .print-slip * {
            visibility: visible !important;
          }
          .print-slip {
            position: absolute !important;
            left: 50%;
            top: 50%;
            transform: translate(-50%, -50%);
            margin: 0 !important;
            box-shadow: none !important;
            background: white !important;
            border: 1px solid #ccc !important;
          }
          .no-print {
            display: none !important;
          }
        }
      `}</style>
    </div>
  );
}

export default AdvancedBVNSlip;
