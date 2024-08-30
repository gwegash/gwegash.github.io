(() => {
  // ui/worklets/loop_worker.js
  function mod_wrap(i, i_max) {
    return (i % i_max + i_max) % i_max;
  }
  var LoopProcessor = class extends AudioWorkletProcessor {
    buffer;
    loopTime_s;
    newBuffer() {
      this.buffer = new Float32Array(this.loopTime_s * sampleRate);
      console.log("resizing buffer to!", this.buffer.length);
    }
    constructor(options) {
      super();
      this.loopTime_s = options.processorOptions.loopTime_s;
      this.newBuffer();
      this.port.onmessage = (e) => {
        if (e.data.loopTime_s !== this.loopTime_s) {
          this.loopTime_s = e.data.loopTime_s;
          this.newBuffer();
        }
      };
    }
    static get parameterDescriptors() {
      return [
        {
          name: "latency",
          defaultValue: 30,
          minValue: 1,
          maxValue: 500,
          automationRate: "k-rate"
        }
      ];
    }
    process(inputs, outputs, parameters) {
      const output = outputs[0];
      const input = inputs[0];
      for (let o = 0; o < output.length; o++) {
        for (let s = 0; s < output[0].length; s++) {
          for (let i = 0; i < input.length; i++) {
            this.buffer[mod_wrap(s + currentFrame, this.buffer.length)] = this.buffer[mod_wrap(s + currentFrame, this.buffer.length)] + input[i][s];
          }
          output[o][s] = this.buffer[mod_wrap(
            s + currentFrame + Math.floor(parameters.latency[0] * sampleRate / 1e3),
            this.buffer.length
          )];
        }
      }
      return true;
    }
  };
  registerProcessor("loop-processor", LoopProcessor);
})();
//# sourceMappingURL=loop_worker.js.map
