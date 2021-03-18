interface String {
  capitalize: () => string;
  isEmpty: () => boolean;
}

String.prototype.capitalize = function() {
  return this.charAt(0).toUpperCase() + this.slice(1);
};

String.prototype.isEmpty = function() {
  return this.length === 0;
};
