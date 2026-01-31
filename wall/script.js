// Sample posts
const posts = [
  "A mismatch of expectations betweem people leads to a lot of conflicts and problems",
  "Engineering of any kind is just taking atoms and assembling them into primitive tools which make up contraptions",
  "Some random shower thought goes here",
];

// Render posts
const wall = document.getElementById("wall");

posts.forEach(text => {
  const box = document.createElement("div");
  box.className = "post";
  box.textContent = text;
  wall.appendChild(box);
});
