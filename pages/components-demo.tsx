import React from 'react';
import { InputBox } from '../frontend/src/components/input/InputBox';
import { Button } from '../frontend/src/components/button/Button';

const ComponentsDemo = () => {
  const handleInput = (value: string) => {
    console.log('Input value:', value);
  };

  return (
    <div className="p-8 space-y-8">
      <h1 className="text-2xl font-bold mb-8">Components Demo</h1>
      
      <section className="space-y-4">
        <h2 className="text-xl font-semibold">Input Box Component</h2>
        <InputBox 
          onSubmit={handleInput}
          placeholder="Try typing something..."
          maxLength={50}
        />
      </section>

      <section className="space-y-4">
        <h2 className="text-xl font-semibold">Button Component</h2>
        <div className="space-x-4">
          <Button>Default Button</Button>
          <Button variant="secondary">Secondary Button</Button>
          <Button variant="text">Text Button</Button>
        </div>
        <div className="space-x-4 mt-4">
          <Button size="sm">Small Button</Button>
          <Button size="md">Medium Button</Button>
          <Button size="lg">Large Button</Button>
        </div>
        <div className="space-x-4 mt-4">
          <Button disabled>Disabled Button</Button>
          <Button onClick={() => alert('Clicked!')}>Click Me</Button>
        </div>
      </section>
    </div>
  );
};

export default ComponentsDemo;
