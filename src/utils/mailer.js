const getConfiguration = () => {
  const serviceID = import.meta.env.VITE_EMAILJS_SERVICE_ID;
  const templateID = import.meta.env.VITE_EMAILJS_TEMPLATE_ID;
  const publicKey = import.meta.env.VITE_EMAILJS_PUBLIC_KEY;
  const missing = [
    ["VITE_EMAILJS_SERVICE_ID", serviceID],
    ["VITE_EMAILJS_TEMPLATE_ID", templateID],
    ["VITE_EMAILJS_PUBLIC_KEY", publicKey],
  ]
    .filter(([, value]) => !value)
    .map(([name]) => name);
  if (missing.length) {
    throw new Error(
      `Contact delivery is not configured. Missing: ${missing.join(", ")}`,
    );
  }
  return { serviceID, templateID, publicKey };
};

export const sendContactForm = async (form) => {
  const { serviceID, templateID, publicKey } = getConfiguration();
  const autoReplyTemplateID = import.meta.env
    .VITE_EMAILJS_AUTOREPLY_TEMPLATE_ID;
  const { default: emailjs } = await import("@emailjs/browser");
  const templateParams = Object.fromEntries(new FormData(form));
  templateParams.from_name = templateParams.from_name.trim();
  templateParams.from_email = templateParams.from_email.trim();
  templateParams.reply_to = templateParams.from_email;
  templateParams.message = templateParams.message.trim();
  await emailjs.send(serviceID, templateID, templateParams, { publicKey });

  if (!autoReplyTemplateID) {
    return { autoReplyConfigured: false, autoReplySent: false };
  }

  try {
    await emailjs.send(serviceID, autoReplyTemplateID, templateParams, {
      publicKey,
    });
    return { autoReplyConfigured: true, autoReplySent: true };
  } catch {
    return { autoReplyConfigured: true, autoReplySent: false };
  }
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
