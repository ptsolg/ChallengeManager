import React, { useState } from 'react';
import { Form } from 'react-bootstrap';

interface NumericControlProps {
    default?: number;
    required?: boolean;
    className?: string;
    onChange(num?: number): void;
}

export default function NumericControl(props: NumericControlProps): JSX.Element {
    const [num, setNum] = useState<string>(props.default === undefined ? '' : props.default.toString());

    function update(e: React.ChangeEvent<HTMLInputElement>) {
        if (!/^\d*$/.test(e.target.value))
            return;
        setNum(e.target.value.trim());
        props.onChange(num === '' ? undefined : parseInt(num));
    }

    return (
        <Form.Control className={props.className} value={num} required={props.required} onChange={update} />
    );
}