export function askNotificationPermission() {
	if (!("Notification" in window)) {
		console.log("This browser does not support notifications.");
		return;
	}

	Notification.requestPermission().then((permission) => {
		if (permission === "granted") {
			console.log("Notification permission granted.");
		} else {
			console.log("Notification permission denied.");
		}
	});
}

export function showNotification(title: string, description: string) {
	if (Notification.permission === "granted") {
		const options: NotificationOptions = {
			body: description,
			// icon: "/path/to/icon.png",
		};
		new Notification(title, options);
	} else {
		console.log("Notification permission not granted.");
	}
}
