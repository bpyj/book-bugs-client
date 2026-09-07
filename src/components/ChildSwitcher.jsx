function ChildSwitcher({
  children,
  selectedChildId,
  onSelectChild,
  onShowAddFriend,
  onShowFriendRequests,
}) {
  return (
    <div className="child-switcher">
      {children.map((child) => (
        <button
          key={child.childId}
          type="button"
          className={
            selectedChildId === child.childId
              ? "child-button active"
              : "child-button"
          }
          onClick={() => onSelectChild(child.childId)}
        >
          {child.avatar?.url ? (
            <img className="child-avatar" src={child.avatar.url} alt="" />
          ) : (
            <span className="child-initial">{child.name.charAt(0)}</span>
          )}
          {child.name}
        </button>
      ))}

      <button type="button" className="child-button" onClick={onShowAddFriend}>
        <span className="child-initial">+</span>
        Add Friend
      </button>

      <button
        type="button"
        className="child-button"
        onClick={onShowFriendRequests}
      >
        Friend Requests
      </button>
    </div>
  );
}

export default ChildSwitcher;
