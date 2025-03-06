import { AppFactory } from "./app.factory";
import { getData } from "./utils/getData";

const app = AppFactory.createApp();

app.event("reaction_added", async ({ event, client }) => {
	try {
		// Get the channel ID of the 'talent-ops-announcements' channel
		const { channels } = await client.conversations.list();
		const targetChannel = channels?.find((c) => c.name === "talent-ops-announcements")?.id;

		// Only proceed if the reaction was added in 'talent-ops-announcements'
		if (event.item.channel !== targetChannel) return;

		const currentUser = await client.users.info({ user: event.user });

		// Get message history from 'talent-ops-announcements' to find the reacted message
		const history = await client.conversations.history({
			channel: targetChannel,
		});

		const reactedMessage = history?.messages?.find(
			(m) => m.ts === event.item.ts
		);

		const data = getData(reactedMessage?.text || "");

		// If the reaction is "bellhop_bell", send a message to the designated channel
		if (event.reaction === "bellhop_bell") {
			await client.chat.postMessage({
				channel: "C08FF9VK3GT", // Replace with the actual channel ID where you want to post
				text: `
		        Hey ${currentUser?.user?.name} (${currentUser?.user?.profile?.email}) reacted with 🔔 in #talent-ops-announcements! 🎉
		        ${data[0]}
            ${data[1]}
		      `,
			});
		}
	} catch (error) {
		console.error(error);
	}
});

(async () => {
	await app.start();
	app.logger.info("⚡ Bolt app is running!");
})();
