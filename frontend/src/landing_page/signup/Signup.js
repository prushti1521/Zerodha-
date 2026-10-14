import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "../../api";

const Signup = ({ initialMode = "signup" }) => {
	const [mode, setMode] = useState(initialMode);
	const [name, setName] = useState("");
	const [email, setEmail] = useState("");
	const [password, setPassword] = useState("");
	const [error, setError] = useState("");
	const [submitting, setSubmitting] = useState(false);
	const isSigningIn = mode === "signin";

	useEffect(() => setMode(initialMode), [initialMode]);

	const handleSubmit = async (event) => {
		event.preventDefault();
		setError("");
		setSubmitting(true);

		try {
			await api.post(isSigningIn ? "/auth/login" : "/auth/signup", {
				...(isSigningIn ? {} : { name }),
				email,
				password,
			});
			const dashboardUrl = process.env.REACT_APP_DASHBOARD_URL || "http://localhost:3001";
			window.location.assign(dashboardUrl);
		} catch (requestError) {
			setError(requestError.response?.data?.error || "Could not reach the server. Try again shortly.");
		} finally {
			setSubmitting(false);
		}
	};

	return (
		<main className="auth-page">
			<section className="auth-panel" aria-labelledby="auth-heading">
				<p className="auth-eyebrow">ZERODHA ACCOUNT</p>
				<h1 id="auth-heading">{isSigningIn ? "Welcome back" : "Create your account"}</h1>
				<p className="auth-intro">
					{isSigningIn ? "Sign in to continue to your dashboard." : "Start with your name, email, and a password."}
				</p>
				<form onSubmit={handleSubmit}>
					{!isSigningIn && (
						<label className="auth-field">
							Full name
							<input autoComplete="name" value={name} onChange={(event) => setName(event.target.value)} required minLength={2} maxLength={100} />
						</label>
					)}
					<label className="auth-field">
						Email address
						<input type="email" autoComplete="email" value={email} onChange={(event) => setEmail(event.target.value)} required />
					</label>
					<label className="auth-field">
						Password
						<input type="password" autoComplete={isSigningIn ? "current-password" : "new-password"} value={password} onChange={(event) => setPassword(event.target.value)} required minLength={8} maxLength={128} />
					</label>
					{error && <p className="auth-error" role="alert">{error}</p>}
					<button className="btn btn-primary auth-submit" type="submit" disabled={submitting}>
						{submitting ? "Please wait…" : isSigningIn ? "Sign in" : "Create account"}
					</button>
				</form>
				<p className="auth-switch">
					{isSigningIn ? "New to Zerodha?" : "Already have an account?"}{" "}
					<Link to={isSigningIn ? "/signup" : "/signin"} onClick={() => setMode(isSigningIn ? "signup" : "signin")}>
						{isSigningIn ? "Create an account" : "Sign in"}
					</Link>
				</p>
			</section>
		</main>
	);
};

export default Signup;
