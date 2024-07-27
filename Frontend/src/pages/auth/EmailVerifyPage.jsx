import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";

import success from "../../../public/success.png";
import "./styles.module.css";

import LoadingSpinner from "../../components/common/LoadingSpinner";
import { useQuery } from "@tanstack/react-query";

const EmailVerifyPage = () => {
    const { id, token } = useParams();

    //query function
    const fetchVerificationStatus = async () => {
      const res = await fetch(`/api/v1/auth/${id}/verify/${token}`, {
        method: 'GET',
      });
  
      if (!res.ok) {
        const errorRes = await res.json();
        throw new Error(errorRes.message || 'Error verifying email');
      }
  
      return res.json();
    };
  
    // Use react-query's useQuery hook
    const { data, error, isLoading } = useQuery({
      queryKey: ['verifyEmail', id, token],
      queryFn: fetchVerificationStatus,
    });
  
    // Determine the validity of the URL
    const validUrl = !error && data?.data?.verifiedEmail != null;

	
	if (isLoading) {
		return <LoadingSpinner />;
	}

	return (
		<div className="w-screen h-screen flex items-center justify-center flex-col">
			{validUrl ? (
				<>
					<h1 className="text-4xl font-bold text-white shadow-lg p-6 rounded-lg transform scale-95 transition-transform duration-300 hover:scale-105 fade-in">
						Email verified successfully
					</h1>
					<Link to="/login">
						<button className="btn rounded-full btn-primary text-white w-24">
							Log in
						</button>
					</Link>
				</>
			) : (
				<h1>404 Not Found</h1>
			)}
		</div>
	);
};

export default EmailVerifyPage;
