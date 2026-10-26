const getConfiguration = () => {
  const serviceID = import.meta.env.VITE_EMAILJS_SERVICE_ID;
  const templateID = import.meta.env.VITE_EMAILJS_TEMPLATE_ID;
  const publicKey = import.meta.env.VITE_EMAILJS_PUBLIC_KEY;
  if (!serviceID || !templateID || !publicKey) {
    throw new Error(
      "Contact delivery is not configured yet. Please connect through the social links below.",
    );
  }
  return { serviceID, templateID, publicKey };
};

export const sendContactForm = async (form) => {
  const { serviceID, templateID, publicKey } = getConfiguration();
  const { default: emailjs } = await import("@emailjs/browser");
  const templateParams = Object.fromEntries(new FormData(form));
  templateParams.from_name = templateParams.from_name.trim();
  templateParams.from_email = templateParams.from_email.trim();
  templateParams.reply_to = templateParams.from_email;
  templateParams.message = templateParams.message.trim();
  return emailjs.send(serviceID, templateID, templateParams, { publicKey });
};

export default async function mail({ name, email, message }) {
  const { serviceID, templateID, publicKey } = getConfiguration();
  const { default: emailjs } = await import("@emailjs/browser");
  return emailjs.send(
    serviceID,
    templateID,
    { name, email, message },
    { publicKey },
  );
}
