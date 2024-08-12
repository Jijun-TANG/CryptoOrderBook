const appendUpdatedId = (updateId, ask, bid) => {
  const insertUpdateId = (order) => {
    if (order && order.length > 2) {
      order[2] = updateId;
    }
    return order;
  };
  if (ask && bid && ask.length > 0 && bid.length > 0) {
    return [ask, bid].map((side) => side.map(insertUpdateId));
  }
  return [];
};

export default appendUpdatedId;
