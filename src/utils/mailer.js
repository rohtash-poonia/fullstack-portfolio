const getConfiguration = () => {
  const serviceID = import.meta.env.VITE_EMAILJS_SERVICE_ID;
  const templateID = import.meta.env.VITE_EMAILJS_TEMPLATE_ID;
  const publicKey = import.meta.env.VITE_EMAILJS_PUBLIC_KEY;
  if (!serviceID || !templateID || !publicKey) {
    throw new Error("Contact delivery is not configured yet. Please connect through the social links below.");
  }
  return { serviceID, templateID, publicKey };
};

export const sendContactForm = async form => {
  const { serviceID, templateID, publicKey } = getConfiguration();
  const { default: emailjs } = await import("@emailjs/browser");
  return emailjs.sendForm(serviceID, templateID, form, { publicKey });
};

export default async function mail({ name, email, message }) {
  const { serviceID, templateID, publicKey } = getConfiguration();
  const { default: emailjs } = await import("@emailjs/browser");
  return emailjs.send(serviceID, templateID, { name, email, message }, { publicKey });
}
