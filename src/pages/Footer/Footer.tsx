import * as React from "react";
import styles from "./Footer.module.scss";
import EmailInput from "./EmailInput";
import SignUpButton from "./SignUpButton";
import { useSubscribers } from "../../utils/SubscriberContext"; // ⬅️ adjust path if needed
import { toast } from "react-hot-toast";

export default function Footer() {
  const [email, setEmail] = React.useState("");
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const { subscribe } = useSubscribers(); // ⬅️ use context action

  const handleEmailChange = (value: string) => setEmail(value);

  const submitEmail = async () => {
    const trimmed = email.trim();
    if (!trimmed || isSubmitting) return;

    try {
      setIsSubmitting(true);
      await subscribe(trimmed); // POST /subscribe + refresh list
      toast.success("You’re in. Check your inbox soon.");
      setEmail("");
    } catch (err: any) {
      console.error(err);
      const message =
        err?.response?.data?.message ||
        err?.message ||
        "Failed to subscribe. Please try again.";
      toast.error(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    void submitEmail();
  };

  const handleSignUpClick = () => {
    void submitEmail();
  };

  return (
    <>
      <footer className={styles.footer}>
        <div className={styles.container}>
          <form className={styles.formContainer} onSubmit={handleSubmit}>
            <span className={styles.heading}>NEWSLETTER</span>
            <EmailInput
              value={email}
              onChange={handleEmailChange}
              placeholder="Email Address"
            />
            <SignUpButton
              onClick={handleSignUpClick}
              disabled={!email.trim()}
              loading={isSubmitting}
            />

          </form>
        </div>
      </footer>

      <div className={styles.copyrightContainer}>
        <div className={styles.container}>
          <p className={styles.copyrightText}>
            <span className={styles.regularText}>© 2025, </span>
            <span className={styles.boldText}>Distressed</span>
            <span className={styles.regularText}>. Made in Tunisia</span>
          </p>
        </div>
      </div>
    </>
  );
}
