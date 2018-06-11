/**
 * Maps input value to a specific range
 * @param   {Number} x:       Mapping value
 * @param   {Number} inMin:  Input min range value
 * @param   {Number} inMax:  Input max range value
 * @param   {Number} outMin: Output min range value
 * @param   {Number} outMax: Output max range value
 * @returns {Number} Mapped value
 */
export const map = (
  x: number,
  inMin: number,
  inMax: number,
  outMin: number,
  outMax: number,
) => (
  (x - inMin) * (outMax - outMin) / (inMax - inMin) + outMin
);
