import React from "react";

interface RoleCardProps {
  title: string;
  description: string;
  onClick: () => void;
}

const RoleCard: React.FC<RoleCardProps> = ({
  title,
  description,
  onClick,
}) => {
  return (
    <div
      onClick={onClick}
      className="cursor-pointer rounded-2xl border border-gray-200 bg-white p-6 shadow-md transition hover:scale-105 hover:shadow-xl"
    >
      <h2 className="mb-2 text-2xl font-semibold">{title}</h2>
      <p className="text-gray-600">{description}</p>
    </div>
  );
};

export default RoleCard;
