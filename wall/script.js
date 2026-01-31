// Sample posts
const posts = [
    "Pretty much all relationship problems are due to a mismatch in expectation",

    "Maths, Factorio, Redstone, and programming are all the same things. You build abstractions from builtin primitives and use those abstractions to assemble complex contraptions",

    "Sometimes wanting something too much becomes a detriment towards getting it",

    "There are times when things just don't go your way, and that's okay. There's a lot of value in teaching yourself to let go of what you can't control and focus on the things that are",

    "I think I spend too much time worrying about the future instead of living in the present. There are so many moments between now and tomorrow, and each decides what tomorrow will look like",

    "A lot of complexity in software often comes from not being able to trust your input"

];

const wall = document.getElementById("wall");

posts.forEach(post => {
    const box = document.createElement("div");
    box.className = "post";
    box.textContent = post;

    // Create character count element
    const count = document.createElement("div");
    count.className = "char-count";
    count.textContent = post.length + "/280"

    box.appendChild(count);
    wall.appendChild(box);
});
