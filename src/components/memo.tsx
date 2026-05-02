import React from "react";

export default function Memo({ children }: { children: React.ReactNode }) {
	return <div className="c-memo">{children}</div>;
}
