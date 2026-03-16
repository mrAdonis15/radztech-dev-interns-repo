const wholeAdvance = {
  caption: " Advance Settings",
  sections: [
    { id: "attachment", title: "Attachment" },
    { id: "horizontal", title: "Horizontal Details" },
    { id: "subtypes", title: "Sub Types" }
  ],
  config: {
    caption: "Advanced Settings",
    items: [
      { key: "nodes1", type: "string", value: "node value" },
      {
        key: "parent",
        type: "object",
        children: [
          { key: "child number 1", type: "string", value: "value 1" }
        ]
      },
      { key: "key1", type: "string", value: "test" },
      { key: "array1", type: "array", value: [1,2,3] }
    ]
  }
};

export default wholeAdvance;
