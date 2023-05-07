class Custom_error extends Error {
  constructor(message: string) {
    super(message);
    this.name = this.constructor.name;
  }
}

export default Custom_error;
