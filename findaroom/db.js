Tasks = new Mongo.Collection("tasks");

Tasks.insert({
      text: "FUCK Miguel",
      createdAt: new Date() // current time
    });

