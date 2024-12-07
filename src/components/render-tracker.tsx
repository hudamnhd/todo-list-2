import React, { useEffect, useRef, useState } from "react";

interface RenderTrackerProps {
	name: string;
	stateName?: string;
}

export const RenderTracker: React.FC<RenderTrackerProps> = ({
	name,
	stateName,
}) => {
	const renderCount = useRef(0);

	renderCount.current++;
	const now = new Date();
	const renderTime = `${now.getHours()}:${now.getMinutes()}:${now.getSeconds()}`;

	return (
		<div>
			<p>Component Name: {name}</p>
			<p>Jumlah Render: {renderCount.current}</p>
			<p>Render Time: {renderTime}</p>
			{stateName && <p>State Changed: {stateName}</p>}
		</div>
	);
};
